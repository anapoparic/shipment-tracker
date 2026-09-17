import { ShipmentStatus } from '../models/shipment.model';

export function formatStatusText(
  status: ShipmentStatus | string,
  isTimelineEvent: boolean = false,
): string {
  if (!status) return '';

  switch (status) {
    case 'CREATED':
      return isTimelineEvent ? 'Picked up' : 'Created';
    case 'IN_TRANSIT':
      return 'In transit';
    case 'OUT_FOR_DELIVERY':
      return 'Out for delivery';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status.replace(/_/g, ' ');
  }
}

export function formatDelay(minutes: number | undefined): string {
  if (minutes === undefined || minutes === null || minutes <= 0) return '';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `Late -${minutes}m`;
  }

  if (remainingMinutes === 0) {
    return `Late -${hours}h`;
  }

  return `Late -${hours}h ${remainingMinutes}m`;
}

export function formatDelayDuration(
  minutes: number | undefined | null,
): string {
  if (!minutes || minutes <= 0) return '0 minuta';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${minutes} ${minutes === 1 ? 'minut' : 'minuta'}`;
  }

  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'sat' : 'sati'}`;
  }

  return `${hours} ${hours === 1 ? 'sat' : 'sati'} i ${remainingMinutes} minuta`;
}
