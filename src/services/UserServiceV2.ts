import {Auth, AuthRequest, UpdateUserRequest, User, UserRequest} from "~@domain";
import {ExistedUserError, InvalidCredentialError} from "~exceptions";
import {getNextIdx} from "~utils";
import {Inject, Injectable} from "~@core";
import {SubwayClient} from "~clients/SubwayClient";
import {AuthRepository} from "~repositories";

@Injectable
export class UserServiceV2 {
  constructor(
    @Inject(SubwayClient) private readonly subwayClient: SubwayClient,
    @Inject(AuthRepository) private readonly authRepository: AuthRepository,
  ) {}

  public getAuth(): Auth | null {
    return this.authRepository.get() || null;
  }

  public signUp(request: UserRequest): void {
    const { repeatPassword, ...user } = request;
    const existed = users.find(v => v.email === user.email);
    if (existed) {
      throw new ExistedUserError();
    }
    this.userRepository.set([
      ...users,
      {
        ...user,
        idx: getNextIdx(),
      }
    ]);
  }

  public updateUser(request: UpdateUserRequest): void {
    const users: User[] = this.getUsers();
    const user: User = users.find(v => v.idx === request.idx)!;
    const existed = users.find(v => v.idx !== request.idx && v.email === request.email);
    if (existed) {
      throw new ExistedUserError();
    }

    users[users.indexOf(user)] = { ...user, name: request.name, email: request.email };

    this.userRepository.set(users);
    this.authRepository.set({
      idx: user.idx,
      name: request.name,
      email: request.email,
    });

  }

  public signIn({ email, password }: AuthRequest): Auth {
    const users: User[] = this.getUsers();
    const user = users.find(v => v.email === email && v.password === password);
    if (!user) {
      throw new InvalidCredentialError();
    }
    const { password: p, ...auth } = user;
    this.authRepository.set(auth);

    return this.getAuth()!;
  }

  public signOut() {
    this.authRepository.clear();
  }
}
