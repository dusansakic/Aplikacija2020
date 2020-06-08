export class JwtDataAdministratorDto {
  administratorId: number;
  username: string;
  exp: number;
  ip: string;
  ua: string;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  toPlainObject() {
    return {
      administratorId: this.administratorId,
      username: this.username,
      ext: this.exp,
      ip: this.ip,
      ua: this.ua,
    };
  }
}
