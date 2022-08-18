export enum TopicCommand {
  //Account
  AccountBuyCourse = 'account.buy-course.command',
  AccountChangeProfile = 'account.change-profile.command',
  AccountCheckPayment = 'account.check-payment.command',
  AccountLogin = 'account.login.command',
  AccountRegister = 'account.register.command',

  //Payment
  PaymentGenerateLink = 'payment.generate-link.command',
}

export enum TopicQuery {
  //Account
  AccountUserCourses = 'account.user-courses.query',
  AccountUserInfo = 'account.user-info.query',

  //Course
  CourseGetCourse = 'course.get-course.query',

  //Payment
  PaymentCheck = 'payment.check.query',
}

export enum TopicEvent {
  //Account
  AccountChangedCourse = 'account.changed-course.event',
  //Course
  //Payment
}
