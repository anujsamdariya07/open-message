import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();

    const decodedUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({ username });

    if (!user) {
      console.log('User not found!');
      return Response.json(
        {
          message: 'User not found!',
          success: false,
        },
        {
          status: 404,
        }
      );
    }

    // Check code and expiry date
    const isValidCode = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    // TODO: Give a seperate page if code is expired

    if (isValidCode && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          message: 'Verification successful!',
          success: true,
        }, 
        {
          status: 200,
        }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          message: 'Verification code expired, please sign again!',
          success: false,
        }, 
        {
          status: 200,
        }
      );
    } else {
      return Response.json(
        {
          message: 'Verification code is incorrect, please sign again!',
          success: false,
        }, 
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    console.log('Error checking otp!', error);
    return Response.json(
      {
        message: 'Error checking otp!',
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
