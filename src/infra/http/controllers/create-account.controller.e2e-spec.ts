import request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "@/infra/app.module";
import { PrismaService } from "@/infra/http/database/prisma/prisma.service";

describe("Create account (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  test("[POST] /accounts", async (): Promise<void> => {
    const response = await request(app.getHttpServer()).post("/accounts").send({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
    });
    expect(response.status).toBe(201);

    const userOnDatabase = await prisma.user.findUnique({
      where: {
        email: "johndoe@example.com",
      },
    });

    expect(userOnDatabase).toBeTruthy();
  });

  afterAll(async () => {
    await app.close();
  });
});
