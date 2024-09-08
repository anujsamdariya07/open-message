import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';
import { User } from 'next-auth';
import mongoose from 'mongoose';

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

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const user = await UserModel.aggregate([
      { $match: { id: userId } },
      { $unwind: 'messages' },
      { $sort: { 'messages.createdAt': -1 } },
      { $group: { _id: '$_id', messages: { $push: '$messages' } } },
    ]);

    if (!user || user.length === 0) {
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
        success: true,
        messages: user[0].messages
      },
      {
        status: 404,
      }
    );
  } catch (error) {
    console.log('Error accessing messages!');
    return Response.json(
      {
        message: 'Error accessing message!',
        success: false,
      },
      {
        status: 401,
      }
    );
  }
}
