import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';
import { z } from 'zod';
import { usernameValidation } from '@/schemas/signUpSchema';

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  // Check request type - Make a helper for this as well
  // if (request.method !== 'GET') {
  //   return Response.json(
  //     {
  //       message: 'Only GET method is allowed!',
  //       success: false,
  //     },
  //     {
  //       status: 405,
  //     }
  //   );
  // }

  await dbConnect();

  try {
    console.log('Inside here!')
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get('username'),
    };
    const result = UsernameQuerySchema.safeParse(queryParam);
    console.log('Result', result);

    if (!result.success) {
      const usernameError = result.error.format().username?._errors || [];
      console.log('Error 1');
      return Response.json(
        {
          success: false,
          message: usernameError.length > 0
          ? usernameError.join(', ')
          : 'Invalid query parameters',
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const verifiedUser = await UserModel.findOne({
      // username: { $regex: username, $options: 'i' },
      username,
      isVerified: true,
    });

    if (verifiedUser) {
      console.log('Error 2')
      return Response.json(
        {
          message: 'Username is not availible!',
          success: false,
        },
        {
          status: 404,
        }
      );
    }
    console.log('Reached Till Here!')
    return Response.json(
      {
        message: 'Username is availible!',
        success: true,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.log('Error checking username', error);
    return Response.json(
      {
        message: 'Error checking username',
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
