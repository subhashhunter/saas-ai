import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/primsa";

function getTodoIdFromUrl(req: NextRequest): string | null {
  const urlParts = req.nextUrl.pathname.split("/");
  const id = urlParts[urlParts.length - 1];
  return id || null;
}

export async function PUT(req: NextRequest) {
  const { userId } =await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { completed } = await req.json();
    const todoId = getTodoIdFromUrl(req);

    if (!todoId) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const todo = await prisma.todo.findUnique({ where: { id: todoId } });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    if (todo.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: todoId },
      data: { completed },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } =await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const todoId = getTodoIdFromUrl(req);

    if (!todoId) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const todo = await prisma.todo.findUnique({ where: { id: todoId } });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    if (todo.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.todo.delete({ where: { id: todoId } });

    return NextResponse.json({ message: "Todo deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
