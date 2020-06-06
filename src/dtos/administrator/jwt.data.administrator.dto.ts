export class JwtDataAdministratorDto {
  administratorId: number;
  username: string;
  ext: number;
  ip: string;
  ua: string;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  toPlainObject() {
    return {
      administratorId: this.administratorId,
      username: this.username,
      ext: this.ext,
      ip: this.ip,
      ua: this.ua,
    };
  }
}
