import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_WRITE_KEY = 'isPublicWrite';
export const PublicWrite = () => SetMetadata(IS_PUBLIC_WRITE_KEY, true);
