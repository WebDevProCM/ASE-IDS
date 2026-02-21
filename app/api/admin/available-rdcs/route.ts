import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import RDC from '@/models/rdc';
import User from '@/models/user';
import { withAuth } from '@/lib/middleware';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getAvailableRDCs(req: NextRequest, user: any) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const role = searchParams.get('role');

    await dbConnect();
    
    const assignedRdcs = await User.find({
      role: { $in: [role] },
      rdcId: { $ne: null }
    }).distinct('rdcId');
    
    const availableRDCs = await RDC.find({
      _id: { $nin: assignedRdcs },
      isActive: true
    }).select('name location region');
    
    return NextResponse.json(availableRDCs);
  } catch (error) {
    console.error('Get available RDCs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getAvailableRDCs, ['admin']);