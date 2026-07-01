import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async check() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      status: "ok",
      database: "connected",
    };
  }
}