import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';
import { ApiResponse } from '@/types/apiResponse';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    const exisitingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

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

    const exisitingUserByEmail = await UserModel.findOne({
      email,
    });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (exisitingUserByEmail) {
      if (exisitingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: 'User already exists with this email!',
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10)
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        exisitingUserByEmail.verifyCode = verifyCode;
        exisitingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await exisitingUserByEmail.save()
      }
    } else {
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

    // Send email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: true,
        message: 'User registered successfully! Please verify your email!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.log('Error registering user!', error);
    return Response.json(
      {
        success: false,
        message: 'Error regsitering user!',
      },
      {
        status: 500,
      }
    );
  }
}
