import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Location from '@/models/Location';

export async function GET() {
  await connectDB();
  const locations = await Location.find({});
  return NextResponse.json(locations);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const location = await Location.create(body);
  return NextResponse.json(location, { status: 201 });
}