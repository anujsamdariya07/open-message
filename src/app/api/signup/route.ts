import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';
import { ApiResponse } from '@/types/apiResponse';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  await dbConnect();

  try {
    console.log('Reached Till Here 1')
    const { username, email, password } = await request.json();
    console.log('Reached Till Here 2')

    const exisitingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    console.log('Reached Till Here 3')

    if (exisitingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: 'Username is already taken!',
        },
        {
          status: 400,
        }
      );
    }
    console.log('Reached Till Here 4')

    const exisitingUserByEmail = await UserModel.findOne({
      email,
    });
    console.log('Reached Till Here 5')

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (exisitingUserByEmail) {
      if (exisitingUserByEmail.isVerified) {
        console.log('User exists and is verified')
        return Response.json(
          {
            success: false,
            message: 'User already exists with this email!',
          },
          { status: 400 }
        );
      } else {
        console.log('User exists but not verified')
        const hashedPassword = await bcrypt.hash(password, 10)
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        exisitingUserByEmail.verifyCode = verifyCode;
        exisitingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await exisitingUserByEmail.save()
      }
    } else {
      console.log('User does not exist')
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });

      const savedUser = await newUser.save();
      console.log(`Saved User: ${savedUser}`);
    }
    console.log('Reached Till Here 6')

    // Send email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    console.log('Reached Till Here 7')

    if (!emailResponse.success) {
      console.log('Reached Here 8')
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    console.log('Reached Till Here 9')
    
    return Response.json(
      {
        success: true,
        message: 'User registered successfully! Please verify your email!',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log('Error registering user!', error);
    return Response.json(
      {
        success: false,
        message: 'Error regsitering user!' + error.message,
      },
      {
        status: 500,
      }
    );
  }
}
