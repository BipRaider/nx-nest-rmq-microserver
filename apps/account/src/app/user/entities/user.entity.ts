import { AccountChangedCourse } from '@purple/contracts';
import { IDomainEvent, IUser, IUserCourses, PurchaseState, UserRole } from '@purple/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';

export class UserEntity implements IUser {
  _id?: string;
  displayName?: string;
  email: string;
  password: string;
  role: UserRole;
  courses?: IUserCourses[] = [];
  events?: IDomainEvent[] = [];

  constructor(user: IUser) {
    this._id = user._id;
    this.displayName = user.displayName;
    this.password = user.password;
    this.email = user.email;
    this.role = user.role;
    this.courses = user.courses;
  }

  public getProfile = () => ({
    role: this.role,
    displayName: this.displayName,
    email: this.email,
    courses: this.courses,
    id: this._id,
  });

  public getPublicProfile = (): Pick<IUser, 'role' | 'displayName' | 'email'> => ({
    role: this.role,
    displayName: this.displayName,
    email: this.email,
  });

  public getCourses = (): IUserCourses[] => this.courses;

  public setPassword = async (password: string): Promise<UserEntity> => {
    const salt = await genSalt(10);
    this.password = await hash(password, salt);
    return this;
  };

  public addCourse = (courseId: string): UserEntity => {
    const exist = this.courses.find((v): boolean => v.courseId === courseId);

    if (exist) throw Error(`Course exist ${courseId}`);

    this.courses.push({
      courseId,
      purchaseState: PurchaseState.Started,
    });

    return this;
  };

  public setCourseStatus = (courseId: string, state: PurchaseState): UserEntity => {
    try {
      return this.addCourse(courseId);
    } catch (e) {
      if (state === PurchaseState.Canceled) {
        return this.deleteCourse(courseId);
      }
    }

    this.courses = this.courses.map((v): IUserCourses => {
      if (v.courseId !== courseId) return v;
      v.purchaseState = state;
      return v;
    });

    this.events.push({
      topic: AccountChangedCourse.topic,
      data: { courseId, userId: this._id, state },
    });

    return this;
  };

  public deleteCourse = (courseId: string): UserEntity => {
    this.courses = this.courses.filter((v): boolean => v.courseId !== courseId);
    return this;
  };

  public updateProfile = (displayName: string): UserEntity => {
    this.displayName = displayName;
    return this;
  };

  public validatePassword = async (password: string): Promise<boolean> => compare(password, this.password);

  public getCourseState = (courseId: string): PurchaseState => {
    const course = this.courses.find(c => c.courseId === courseId);

    return course ? course.purchaseState : PurchaseState.Started;
  };
}
