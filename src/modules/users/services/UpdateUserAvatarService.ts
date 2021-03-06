import { getRepository } from 'typeorm';
import path from 'path';
import fs from 'fs';
import uploadConfig from '@config/upload';

import AppError from '@shared/errors/AppError';

import User from '../infra/typeorm/entities/User';

interface Request {
  user_id: string;
  avatarFileName: string;
}

class UpdateUserAvatarService {
  public async execute({ user_id, avatarFileName }: Request): Promise<User> {
    const usersRepository = getRepository(User);

    // Verifica se o usuario existe.
    const user = await usersRepository.findOne(user_id);
    if (!user) {
      throw new AppError('Only authenticated users can change avatar', 401);
    }

    // Exclui o arquivo de avatar antigo caso existir.
    if (user.avatar) {
      const userAvatarFilePath = path.join(uploadConfig.directory, user.avatar);
      const userAvatarFileExists = await fs.promises.stat(userAvatarFilePath);

      if (userAvatarFileExists) {
        await fs.promises.unlink(userAvatarFilePath);
      }
    }

    // Atualiza a referencia do arquivo de avatar.
    user.avatar = avatarFileName;

    // Salva o usuario no banco.
    await usersRepository.save(user);

    return user;
  }
}

export default UpdateUserAvatarService;
