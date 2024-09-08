import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';
import { Message } from '@/models/user.model';

export async function POST(request: Request) {
  await dbConnect();

  const { username, content } = await request.json();

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
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

    // Is user accepting the messages
    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          message: 'User is not accepting messages right now!',
          success: false,
        },
        {
          status: 403,
        }
      );
    }

    const newMessage = {
      content,
      createdAt: new Date(),
    };

    user.messages.push(newMessage as Message);
    await user.save();

    return Response.json(
      {
        message: 'Message sent successfully!',
        success: true,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log('Error sending messages!');
    return Response.json(
      {
        message: 'Error sending message!',
        success: false,
      },
      {
        status: 401,
      }
    );
  }
}
