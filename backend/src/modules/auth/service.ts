import bcrypt from 'bcrypt';
import authRepository from './repository';
import { UserDTO } from './dto';
import { UnauthorizedError, NotFoundError } from '@core/utils/errors';

class AuthService {
  async login(email: string, password: string): Promise<UserDTO> {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: new Date(),
    };
  }

  async getCurrentUser(userId: string): Promise<UserDTO> {
    const user = await authRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: new Date(),
    };
  }
}

export default new AuthService();
