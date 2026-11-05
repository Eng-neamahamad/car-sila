import { AppNotification, ActivityEvent, Conversation, Report, User, Vehicle, VehicleStatus } from '../types';

export class ApiError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

export type Workspace = {
  user: User | null;
  vehicles: Vehicle[];
  reports: Report[];
  conversations: Conversation[];
  notifications: AppNotification[];
  activities: ActivityEvent[];
  users: User[];
  mailReady?: boolean;
  visitors?: { total: number; week: number; points: number[] };
};

export type PublicVehicle = {
  qrToken: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  status: VehicleStatus;
};

export const toVisitorVehicle = (vehicle: PublicVehicle): Vehicle => ({
  id: vehicle.qrToken,
  ownerId: '',
  ownerName: '',
  brand: vehicle.brand,
  model: vehicle.model,
  year: vehicle.year,
  color: vehicle.color,
  plateNumber: vehicle.plateNumber,
  qrToken: vehicle.qrToken,
  status: vehicle.status,
  scansCount: 0,
  reportsCount: 0,
  createdAt: ''
});

export async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code = typeof data.error === 'string' ? data.error : 'request_failed';
    throw new ApiError(code);
  }
  return data as T;
}
