export enum UserRole {
  ADMIN = 'Admin',
  TEACHER = 'Teacher',
  STUDENT = 'Student',
}

export enum PurchaseState {
  Started = 'Started',
  WaitingForPayment = 'WaitingForPayment',
  Purchase = 'Purchase',
  Canceled = 'Canceled',
}

export interface IUser {
  _id?: string;
  displayName?: string;
  email: string;
  password: string;
  role: UserRole;
  courses?: IUserCourses[];
}
export interface IUserCourses {
  courseId: string;
  purchaseState: PurchaseState;
}
