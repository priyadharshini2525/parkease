import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Slot from '@/models/Slot';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const body = await req.json();
  const slot = await Slot.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(slot);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  await Slot.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Deleted' });
}