import request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { hash } from "bcryptjs";
import { JwtService } from "@nestjs/jwt";

describe("Fetch recent question (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[GET] /questions", async () => {
    const user = await prisma.user.create({
      data: {
        name: "John Doe",
        email: "johndoe@example.com",
        password: await hash("123456", 8),
      },
    });

    const accessToken = jwt.sign({ sub: user.id });

    await prisma.question.createMany({
      data: [
        {
          title: "Question 1",
          content: "Question 1 content",
          authorId: user.id,
          slug: "question-1",
        },
        {
          title: "Question 2",
          content: "Question 2 content",
          authorId: user.id,
          slug: "question-2",
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get("/questions")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      questions: [
        expect.objectContaining({ title: "Question 1" }),
        expect.objectContaining({ title: "Question 2" }),
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
