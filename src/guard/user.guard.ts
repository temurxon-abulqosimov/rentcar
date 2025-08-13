import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from 'src/users/entities/user.entity';

@Injectable()
export class UserAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const decoded = this.jwtService.verify(token);
      
      // Check if the decoded token has the required fields
      if (!decoded.id || !decoded.role) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Check if the role is CUSTOMER
      if (decoded.role !== UserRole.CUSTOMER) {
        throw new UnauthorizedException('Insufficient permissions - CUSTOMER role required');
      }

      // Attach user information to the request object
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
