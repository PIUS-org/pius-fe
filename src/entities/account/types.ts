export type Role = 'MASTER' | 'EMPLOYEE' | 'CONTRACTOR';
export type AccountStatus = 'ACTIVE' | 'INACTIVE';

/** 로그인 응답과 `/auth/me` 가 공유하는 내 계정 요약. */
export type AccountSummary = {
  accountId: number;
  loginId: string;
  role: Role;
  roleLabel: string;
  personId: number;
  name: string;
  jobTitle: string | null;
};

export type LoginResponse = {
  accessToken: string;
  expiresIn: number;
  account: AccountSummary;
};
