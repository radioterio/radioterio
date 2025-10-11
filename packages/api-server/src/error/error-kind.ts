export enum ErrorKind {
  InternalServerError = "InternalServerError",
  MissingAuthorizationHeader = "MissingAuthorizationHeader",
  IncorrectAuthorizationHeader = "IncorrectAuthorizationHeader",
  UserNotFound = "UserNotFound",
  ChannelNotFound = "ChannelNotFound",
  ChannelNotPlaying = "ChannelNotPlaying",
  MissingEmailOrPassword = "MissingEmailOrPassword",
  WrongEmailOrPassword = "WrongEmailOrPassword",
}
