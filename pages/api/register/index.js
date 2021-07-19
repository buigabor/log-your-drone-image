import argon2 from 'argon2';
import cookie from 'cookie';
import crypto from 'crypto';
import {
  deleteExpiredSessions,
  getUserByName,
  insertSession,
  saveUser,
} from '../../../utils/database';

const handler = async (req, res) => {
  if (req.method === 'POST') {
    console.log(req.body);

    const username = req.body.username;
    const password = req.body.password;

    const currentUser = await getUserByName(username);
    if (currentUser) {
      console.log('foglalt');
    } else {
      const hashedPassword = await argon2.hash(password);

      const savedUser = await saveUser(username, hashedPassword);
      console.log(savedUser);
      // saveUser(username, hashedPassword);

      // const userId = await saveUser();
      const userId = savedUser.id;
      const token = crypto.randomBytes(24).toString('base64');

      await insertSession(token, userId);

      res.setHeader(
        'Set-Cookie',
        cookie.serialize('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 72,
          path: '/',
        }),
      );

      await deleteExpiredSessions();

      return res.status(200).json({ success: true });
    }
  }
};
export default handler;