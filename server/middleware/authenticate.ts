import { Request, Response, NextFunction } from "express";

export default async function authenticate(
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  next();
}
