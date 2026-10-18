export type UserRole = "Admin" | "Lead" | "Member";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthenticatedUser = {
  id: number;
  email: string;
  role: UserRole;
};
