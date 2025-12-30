import { NextRequest, NextResponse } from "next/server";
import { twitterAccount } from "@/lib/db";

export async function GET() {
  try {
    const account = twitterAccount.get();
    return NextResponse.json(account);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch account" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const account = twitterAccount.create(data);
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const account = twitterAccount.update(data);
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }
    return NextResponse.json(account);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }
}
