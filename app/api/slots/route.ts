import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Slot from '@/models/Slot';

export async function GET(req: NextRequest) {
  await connectDB();
  const locationId = req.nextUrl.searchParams.get('locationId');
  const filter = locationId ? { locationId } : {};
  const slots = await Slot.find(filter);
  return NextResponse.json(slots);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const slot = await Slot.create(body);
  return NextResponse.json(slot, { status: 201 });
}