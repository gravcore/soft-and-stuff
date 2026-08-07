import { JwtPayload } from ".";

declare global {
    namespace Express {
        interface User extends JwtPayload {};
    }
}