import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';
import { User } from 'next-auth';

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        message: 'Unauthorized',
        success: false,
      },
      {
        status: 401,
      }
    );
  }

  const userId = user?._id;
  const { acceptMessages } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        isAcceptingMessage: acceptMessages,
      },
      {
        new: true,
      }
    );

    if (!user) {
      return Response.json(
        {
          message: 'Failed to update user status of accepting messages!',
          success: false,
        },
        {
          status: 401,
        }
      );
    }

    return Response.json(
      {
        message: 'Successfully updated user status of accepting messages!',
        success: true,
        updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return Response.json(
      {
        message: 'Failed to update user status of accepting messages!',
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        message: 'Unauthorized',
        success: false,
      },
      {
        status: 401,
      }
    );
  }

  const userId = user?._id;

  try {
    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
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

    return Response.json(
      {
        message: 'User found!',
        success: false,
        isAcceptingMessage: foundUser.isAcceptingMessage,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return Response.json(
      {
        message: 'Failed to get message acceptance status!',
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
