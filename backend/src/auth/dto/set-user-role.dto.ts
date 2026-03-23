import { IsIn, IsString } from 'class-validator';
import { CANONICAL_ROLES } from '../../security/role-hierarchy';

export class SetUserRoleDto {
  @IsString()
  @IsIn(CANONICAL_ROLES)
  role: (typeof CANONICAL_ROLES)[number];
}
