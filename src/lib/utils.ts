import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getCourierTrackingUrl(carrier?: string, trackingNumber?: string): string | null {
  if (!trackingNumber) return null;
  const clean = trackingNumber.trim();
  const c = (carrier || '').toLowerCase();
  if (c.includes('delhivery')) {
    return `https://www.delhivery.com/track/package/${clean}`;
  }
  if (c.includes('shadowfax')) {
    return `https://tracker.shadowfax.in/#/track?awb=${clean}`;
  }
  if (c.includes('xpress') || c.includes('xpressbees')) {
    return `https://www.xpressbees.com/track?isawb=Yes&trackid=${clean}`;
  }
  if (c.includes('dtdc')) {
    return `https://www.dtdc.in/tracking/shipment-tracking.asp`;
  }
  if (c.includes('blue') || c.includes('dart')) {
    return `https://www.bluedart.com/tracking`;
  }
  if (c.includes('ecom')) {
    return `https://ecomexpress.in/tracking/?awb=${clean}`;
  }
  if (c.includes('post') || c.includes('speed')) {
    return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`;
  }
  return null;
}


