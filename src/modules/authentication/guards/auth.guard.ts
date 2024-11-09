import { applyDecorators, Injectable, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export function Authenticated() {
  return applyDecorators(UseGuards(JwtAuthGuard));
}

@Injectable()
class JwtAuthGuard extends AuthGuard('jwt') {}
