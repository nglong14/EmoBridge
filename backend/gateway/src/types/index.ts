export type AuthUser = {
  readonly id: string;
  readonly email: string;
};

// Extend Express Request so req.user is available after requireAuth
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
