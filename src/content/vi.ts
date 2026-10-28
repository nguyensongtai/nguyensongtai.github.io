import * as en from "./portfolio";
import type { CaseStudy, JourneyStage, Principle } from "./types";

/**
 * Bản tiếng Việt. Số liệu, stack, đường dẫn và đoạn code dùng chung với bản
 * tiếng Anh (portfolio.ts); ở đây chỉ thay phần chữ. Cập nhật cả hai cùng lúc.
 */
export const profile: typeof en.profile = {
  ...en.profile,
  name: "Nguyễn Song Tài",
  availability: "Sẵn sàng cho cơ hội mới",
  location: "TP. Hồ Chí Minh, Việt Nam",
  focus: ["React", "Next.js", "TypeScript", "Hiệu năng web", "Tích hợp AI"],
  quote: { lead: "Mọi lập trình viên giỏi đều bắt đầu từ", accent: "một dòng code đầu tiên." },
  intro:
    "Tôi xây dựng các sản phẩm web hiện đại bằng React, Next.js và TypeScript, tập trung vào trải nghiệm người dùng, kiến trúc giao diện có khả năng mở rộng và hiệu năng ứng dụng.",
};

export const navigation: typeof en.navigation = [
  { href: "#stage-1", label: "Hành trình" },
  { href: "#projects", label: "Dự án" },
  { href: "#approach", label: "Cách làm việc" },
  { href: "#contact", label: "Liên hệ" },
];

export const journey: JourneyStage[] = [
  {
    ...en.journey[0],
    title: "Những dòng code đầu tiên",
    place: "Trường ĐH Khoa học Tự nhiên, ĐHQG-HCM · Cao đẳng Công nghệ Thông tin",
    lead: "Mọi thứ bắt đầu trong một căn phòng nhỏ vào ban đêm: một màn hình, một trình soạn thảo và trang web đầu tiên hiện lên.",
    points: [
      "Học Công nghệ Thông tin tại Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM",
      "Bắt đầu tìm hiểu lập trình và phát triển giao diện web",
      "Xây dựng nền tảng HTML, CSS và JavaScript",
    ],
  },
  {
    ...en.journey[1],
    title: "Những bước chân đầu tiên trong ngành",
    lead: "Một digital agency, khách hàng doanh nghiệp và deadline thật: nơi giao diện trở thành sản phẩm mà người khác dựa vào.",
    points: [
      "Xây dựng giao diện React responsive, đạt chuẩn WCAG cho cổng thương mại điện tử và công cụ cấu hình xe của Nissan, cùng luồng đặt vé của Philippine Airlines",
      "Bàn giao dự án đúng deadline của agency, qua các vòng kiểm duyệt nghiêm ngặt về QA, bảo mật và nhận diện thương hiệu",
      "Học cách phối hợp với team và phát triển tính năng theo yêu cầu của khách hàng",
    ],
  },
  {
    ...en.journey[2],
    title: "Xây dựng sản phẩm thực tế",
    lead: "Hai sản phẩm được dùng hằng ngày ở quy mô lớn: sàn mua bán xe máy với hơn 1,5 triệu người dùng, rồi CRM đa tenant cho hơn 10.000 salon tại Hàn Quốc.",
    points: [
      "Nghiệp vụ phức tạp: đăng tin, tìm kiếm và bộ lọc, thanh toán, dashboard người bán, lịch đặt hẹn và bảng dữ liệu",
      "Component tái sử dụng: thư viện module dùng chung ở OKXE và thư viện component đa theme ở Ahasoft",
      "Phân quyền và luồng dữ liệu theo vai trò, tách biệt hoàn toàn dữ liệu giữa các tenant",
      "Code nhanh hơn, dễ bảo trì hơn: trang tin đăng tải nhanh hơn ~30%, chu kỳ release ngắn hơn ~30%, lỗi UI giảm ~20%",
    ],
  },
  {
    ...en.journey[3],
    era: "2025 — nay",
    title: "Frontend engineering hiện đại",
    lead: "Dẫn dắt phần frontend của moso.vn, sàn bất động sản PropTech với hơn 24.000 tin đăng đang hoạt động: kiến trúc, hiệu năng, SEO và tính năng AI chạy production.",
    points: [
      "React, Next.js 15 và TypeScript, với React Server Components và streaming SSR",
      "Phát triển theo hướng component, theo một chuẩn kiến trúc được 9 repository production áp dụng",
      "Technical SEO và Core Web Vitals: LCP trên mobile giảm ~40%, điểm Lighthouse performance từ 40 lên 70",
      "Tối ưu bundle và tốc độ tải cho mobile: code splitting, tải ảnh và font, cache qua CDN",
      "AI ở nơi thực sự giúp người dùng: chat streaming, tìm kiếm RAG có dẫn nguồn, agent LangGraph với MCP server",
    ],
  },
  {
    ...en.journey[4],
    era: "Tiếp theo",
    title: "Vượt qua đường chân trời",
    place: "Cách tôi làm việc và hướng đi tiếp theo",
    lead: "Từ đỉnh của con đường, cả thành phố hiện ra: những sản phẩm, những người dùng chúng và các hệ thống phía sau.",
    points: [
      "Bắt đầu từ bài toán sản phẩm, rồi mới chọn chiến lược rendering, dữ liệu và component phù hợp",
      "Xem chất lượng code, hiệu năng và khả năng mở rộng là mặc định, không phải việc dọn dẹp về sau",
      "Hướng tới full-stack engineering: đã làm thực tế với Node.js, Fastify, MongoDB và Elasticsearch phía sau moso.vn",
    ],
  },
];

const study = (id: string) => en.caseStudies.find((s) => s.id === id)!;
const moso = study("moso");
const salon = study("salon");
const okxe = study("okxe");

export const caseStudies: CaseStudy[] = [
  {
    ...moso,
    kicker: "Nền tảng PropTech",
    period: "04/2025 — nay",
    summary:
      "Tôi dẫn dắt phần frontend của một sàn bất động sản: tìm kiếm, đăng tin, danh bạ môi giới, khám phá dự án trên bản đồ, trang quản trị/CRM và tính năng tìm nhà bằng AI.",
    challenge:
      "Một sàn nhiều nội dung phải tải nhanh trên mobile, mọi trang tin đăng và dự án phải được index, và code phải dễ bảo trì trong khi sản phẩm liên tục mở rộng: công cụ quản trị/CRM, ứng dụng mobile, dịch vụ AI.",
    decisions: [
      {
        title: "Xem hiệu năng là bài toán rendering",
        body: "Tôi tinh chỉnh streaming SSR và hydration, chia code theo route, làm lại cách tải ảnh và font, đưa các response có thể cache lên CDN. Điểm lab trở thành mục tiêu theo dõi liên tục, không phải một lần audit.",
      },
      {
        title: "Đưa SEO vào ngay mô hình trang",
        body: "JSON-LD, sitemap động, metadata và Open Graph được sinh cho mọi trang tin đăng và dự án, nên trang mới mặc định đã được index.",
      },
      {
        title: "Một chuẩn kiến trúc cho chín repo",
        body: "Cấu trúc thư mục, quy ước API và i18n, chiến lược test, kèm công cụ codegen và prompt sinh module đúng chuẩn. Tôi hướng dẫn team áp dụng qua code review.",
      },
      {
        title: "Mô hình hoá quyền, không phải nút bấm",
        body: "Tôi thiết kế RBAC đa tenant xuyên suốt UI và backend cho các module quản trị/CRM (xác minh giao dịch, telesales, nhân sự, báo cáo), để quy tắc truy cập nằm ở một nơi.",
      },
    ],
    owned: [
      "Frontend cho tìm kiếm, đăng tin, danh bạ môi giới và trang dự án trên bản đồ",
      "Tối ưu hiệu năng: streaming SSR, hydration, code splitting, tải ảnh/font và cache CDN",
      "Nền tảng technical SEO: JSON-LD, sitemap động, metadata, Open Graph",
      "Chuẩn kiến trúc frontend, cùng công cụ codegen và prompt",
      "Thiết kế RBAC đa tenant xuyên suốt UI và backend",
      "Chat tìm nhà bằng AI, tìm kiếm RAG, dịch vụ agent LangGraph với MCP server",
    ],
    teamContext: [
      "Phối hợp cùng Product, Design và Backend.",
      "Quy mô nền tảng (hơn 24.000 tin đăng, hơn 26.000 người dùng) là kết quả của cả công ty; phần frontend ở trên góp phần vào đó.",
      "Tăng trưởng organic được đo trong sáu tháng sau khi nền tảng SEO ra mắt.",
    ],
    metrics: [
      { ...moso.metrics[0], label: "LCP trên mobile giảm", context: "Nhờ streaming SSR, hydration, code splitting, tải ảnh/font và cache CDN." },
      { ...moso.metrics[1], label: "điểm Lighthouse performance (+75%)", context: "Điểm lab, được theo dõi như một mục tiêu liên tục." },
      { ...moso.metrics[2], label: "tăng trưởng traffic organic", context: "Trong vòng sáu tháng sau nền tảng technical SEO." },
      {
        ...moso.metrics[3],
        label: "onboarding developer nhanh hơn",
        context: "Chuẩn kiến trúc được 9 repository production áp dụng. Codegen giúp thời gian dựng module mới giảm ~50%.",
      },
      { ...moso.metrics[4], label: "tin đăng · hơn 26.000 người dùng", context: "Quy mô nền tảng. Kết quả của cả team." },
    ],
    details: [
      {
        title: "Rendering và hiệu năng",
        items: [
          "Streaming SSR để khung trang hiển thị trước khi các phần nặng dữ liệu tải xong",
          "Tinh chỉnh hydration để giảm việc trên main thread ở mobile",
          "Code splitting theo route và lazy load phần UI không quan trọng",
          "Chiến lược tải ảnh và font cho các trang nhiều tin đăng",
          "Cache CDN cho các response có thể cache",
        ],
      },
      {
        title: "Technical SEO",
        items: [
          "JSON-LD structured data trên trang tin đăng và dự án",
          "Sitemap động bám theo kho tin đăng thực tế",
          "Metadata và Open Graph riêng cho từng trang",
        ],
      },
      {
        title: "Kiến trúc và công cụ",
        items: [
          "Quy ước chung cho cấu trúc thư mục, lớp API, i18n và test",
          "Công cụ codegen và prompt sinh module đúng chuẩn (dựng nhanh hơn ~50%)",
          "Hướng dẫn áp dụng qua code review trên 9 repository production",
        ],
      },
    ],
  },
  {
    ...salon,
    kicker: "B2B SaaS · Hàn Quốc",
    period: "03/2024 — 03/2025",
    summary:
      "CRM đa tenant được nhân viên của hơn 10.000 salon tại Hàn Quốc dùng hằng ngày. Tôi xây dựng bảng dữ liệu, lịch đặt hẹn và form đặt lịch từ bản Figma của team sản phẩm Hàn Quốc.",
    challenge:
      "Nhân viên salon làm việc cả ngày trên những màn hình dày đặc thông tin. Dữ liệu của từng tenant phải được tách biệt, và một thư viện component phải phục vụ nhiều theme mà không phát sinh lỗi.",
    decisions: [
      {
        title: "Giao diện cho vận hành hằng ngày",
        body: "Bảng dữ liệu, lịch đặt hẹn và form đặt lịch được thiết kế để nhanh và rõ ràng trong một ngày salon đông khách, bám sát bản Figma của team sản phẩm.",
      },
      {
        title: "Phân quyền với sự tách biệt thật sự",
        body: "Phân quyền theo vai trò, tách biệt hoàn toàn dữ liệu giữa các tenant, để mỗi salon chỉ thấy và thao tác trên dữ liệu của mình.",
      },
      {
        title: "Một thư viện component, nhiều theme",
        body: "Tôi duy trì thư viện component dùng chung cho nhiều theme của các tenant, giúp lỗi UI giảm ~20%.",
      },
    ],
    owned: [
      "Bảng dữ liệu, lịch đặt hẹn và form đặt lịch",
      "Phân quyền theo vai trò với dữ liệu tách biệt theo tenant",
      "Duy trì thư viện component dùng chung, đa theme",
    ],
    teamContext: ["Đặc tả đến từ team sản phẩm Hàn Quốc; con số hơn 10.000 salon là quy mô của sản phẩm."],
    metrics: [
      { ...salon.metrics[0], label: "lỗi UI ít hơn", context: "Nhờ thư viện component dùng chung cho các theme của tenant." },
      { ...salon.metrics[1], label: "salon tại Hàn Quốc", context: "Quy mô sản phẩm. Các màn hình tôi xây dựng được nhân viên salon dùng hằng ngày." },
    ],
    details: [
      {
        title: "Điều làm nó khó",
        items: [
          "Bảng và lịch mật độ cao nhưng vẫn phải dễ đọc và nhanh",
          "Tách biệt theo tenant ở cả UI lẫn tầng dữ liệu",
          "Nhiều biến thể theme dùng chung một bộ component mà không lỗi giao diện",
        ],
      },
    ],
  },
  {
    ...okxe,
    kicker: "Sàn mua bán xe máy · Việt Nam",
    period: "04/2022 — 03/2024",
    summary:
      "Sàn mua bán với hơn 1,5 triệu người dùng và hơn 2 triệu tin đăng. Trong team Agile/Scrum, tôi phát triển tính năng đăng tin, tìm kiếm và bộ lọc, thanh toán và dashboard người bán.",
    challenge:
      "Trên các trang tin đăng có lượng truy cập cao, tốc độ tải quyết định cách người dùng duyệt tin. Quy trình release cũng phải theo kịp một team làm việc nhanh.",
    decisions: [
      {
        title: "Trang tin đăng nhanh hơn",
        body: "Lazy loading, tối ưu ảnh và code splitting trên các trang tin đăng nhiều truy cập giúp thời gian tải trang giảm ~30%.",
      },
      {
        title: "Module dùng chung, release ngắn hơn",
        body: "Tôi tách logic dùng chung thành thư viện module tái sử dụng và tinh gọn CI/CD, giúp chu kỳ release ngắn hơn ~30%.",
      },
    ],
    owned: [
      "Đăng tin, tìm kiếm và bộ lọc, thanh toán và dashboard người bán",
      "Tối ưu hiệu năng trên các trang tin đăng nhiều truy cập",
      "Thư viện module tái sử dụng và tinh gọn CI/CD",
    ],
    teamContext: ["Làm việc trong team Agile/Scrum; hơn 1,5 triệu người dùng và 2 triệu tin đăng là quy mô của sàn."],
    metrics: [
      { ...okxe.metrics[0], label: "tải trang nhanh hơn", context: "Lazy loading, tối ưu ảnh và code splitting trên trang tin đăng." },
      { ...okxe.metrics[1], label: "chu kỳ release ngắn hơn", context: "Nhờ thư viện module tái sử dụng và CI/CD tinh gọn." },
      { ...okxe.metrics[2], label: "người dùng · hơn 2 triệu tin đăng", context: "Quy mô của sàn. Kết quả của cả team." },
    ],
    details: [
      {
        title: "Bộ công cụ tối ưu",
        items: [
          "Lazy load ảnh/video tin đăng nằm dưới màn hình đầu",
          "Tối ưu ảnh cho thư viện ảnh tin đăng",
          "Code splitting để mỗi route chỉ tải những gì nó hiển thị",
        ],
      },
    ],
  },
];

const principle = (id: string) => en.principles.find((p) => p.id === id)!;
const translate = (id: string, t: Pick<Principle, "title" | "statement" | "practice"> & { label: string }): Principle => {
  const p = principle(id);
  return { ...p, title: t.title, statement: t.statement, practice: t.practice, snippet: { ...p.snippet, label: t.label } };
};

export const principles: Principle[] = [
  translate("architecture", {
    title: "Kiến trúc frontend và design system tái sử dụng",
    statement: "Tôi xem các quy ước như một sản phẩm dành cho những kỹ sư khác sử dụng.",
    practice: [
      "Định nghĩa chuẩn kiến trúc (cấu trúc, quy ước API và i18n, chiến lược test) được 9 repo production áp dụng",
      "Xây dựng công cụ codegen và prompt sinh module đúng chuẩn, giảm ~50% thời gian dựng",
      "Duy trì thư viện component đa theme, giúp lỗi UI giảm ~20%",
    ],
    label: "cấu trúc module · minh hoạ",
  }),
  translate("performance", {
    title: "Tối ưu hiệu năng và Core Web Vitals",
    statement: "Đo trước, rồi mới xử lý điểm nghẽn. Không bao giờ tối ưu theo phỏng đoán.",
    practice: [
      "Giảm ~40% LCP trên mobile cho moso.vn và nâng điểm Lighthouse performance từ 40 lên 70",
      "Giảm ~30% thời gian tải trang trên các trang tin đăng nhiều truy cập của OKXE",
      "Dùng điểm lab làm mục tiêu để tiếp tục cải thiện, không phải vạch đích",
    ],
    label: "stream phần chậm · pattern",
  }),
  translate("seo", {
    title: "Technical SEO, SSR và chiến lược rendering",
    statement: "Trên một sàn giao dịch, mỗi tin đăng là một landing page.",
    practice: [
      "Xây dựng JSON-LD, sitemap động, metadata và Open Graph cho mọi trang tin đăng và dự án",
      "Tăng ~30% traffic organic trong vòng sáu tháng",
      "Chọn SSR, streaming hay static rendering cho từng trang theo nội dung của nó",
    ],
    label: "structured data · pattern",
  }),
  translate("workflows", {
    title: "Nghiệp vụ phức tạp và giao diện đa tenant",
    statement: "Mô hình hoá quyền, không phải nút bấm.",
    practice: [
      "Thiết kế RBAC đa tenant xuyên suốt UI và backend cho các module quản trị/CRM của MOSO",
      "Xây dựng phân quyền theo vai trò, tách biệt hoàn toàn theo tenant cho CRM hơn 10.000 salon",
      "Xây dựng lịch đặt hẹn, bảng dữ liệu dày đặc và form nhiều bước",
    ],
    label: "một quy tắc, áp dụng mọi nơi · pattern",
  }),
  translate("ai", {
    title: "Tích hợp AI, tìm kiếm RAG và trải nghiệm streaming",
    statement: "Tôi phát triển tính năng AI với cùng sự chặt chẽ như mọi phần khác của sản phẩm.",
    practice: [
      "Xây dựng chat tìm nhà bằng AI dạng streaming với trạng thái đang xử lý rõ ràng",
      "Xây dựng tìm kiếm RAG có hiển thị nguồn, để mọi câu trả lời đều kiểm chứng được",
      "Xây dựng dịch vụ agent LangGraph và MCP server phía sau",
    ],
    label: "hiển thị một stream · pattern",
  }),
  translate("delivery", {
    title: "Phối hợp liên chức năng và chất lượng code",
    statement: "Frontend tốt bắt đầu từ buổi trao đổi yêu cầu, trước khi viết dòng code nào.",
    practice: [
      "Làm việc cùng Product, Design và Backend từ yêu cầu đến khi release",
      "Hướng dẫn đồng đội qua code review thay vì chỉ viết tài liệu quy tắc",
      "Bàn giao dự án agency đúng deadline qua các vòng kiểm duyệt QA, bảo mật và thương hiệu",
    ],
    label: "checklist review · minh hoạ",
  }),
];

export const ai: typeof en.ai = {
  title: "Tính năng AI, được xây dựng như mọi phần khác của sản phẩm",
  intro:
    "Ở MOSO, tôi xây dựng tính năng tìm nhà bằng AI từ đầu đến cuối: giao diện chat streaming, tìm kiếm RAG có hiển thị nguồn, và dịch vụ agent LangGraph phía sau, kèm MCP server cung cấp các công cụ của nó.",
  pillars: [
    {
      id: "chat",
      label: "Chat tìm nhà dạng streaming",
      body: "Câu trả lời hiện ra ngay khi được sinh, với trạng thái đang xử lý, kết quả một phần và lỗi rõ ràng. Người dùng thấy tiến trình ngay thay vì nhìn vòng xoay chờ.",
    },
    {
      id: "rag",
      label: "Tìm kiếm RAG có dẫn nguồn",
      body: "Kết quả dựa trên các tin đăng được truy xuất và hiển thị kèm nguồn, để người dùng kiểm tra câu trả lời và mở thẳng tin đăng.",
    },
    {
      id: "agent",
      label: "Agent LangGraph + MCP server",
      body: "Dịch vụ agent LangGraph điều phối các công cụ (tìm bất động sản, tra cứu vị trí, kiến thức). MCP server cung cấp các công cụ đó cho client khác qua một giao diện chuẩn.",
    },
  ],
};

export const toolkit: typeof en.toolkit = en.toolkit.map((g) => ({
  ...g,
  group:
    ({ "UI & styling": "UI và styling", "State & data": "State và dữ liệu", "Performance & SEO": "Hiệu năng và SEO" } as Record<string, string>)[
      g.group
    ] ?? g.group,
}));

export const meta: typeof en.meta = {
  lang: "vi",
  ogLocale: "vi_VN",
  title: "Nguyễn Song Tài — Frontend Developer",
  description:
    "Frontend Developer tại TP. Hồ Chí Minh với hơn 5 năm xây dựng sản phẩm bằng React, Next.js và TypeScript. Một hành trình tương tác từ dòng code đầu tiên đến kiến trúc frontend, Core Web Vitals, technical SEO và tính năng AI.",
};

export const ui: typeof en.ui = {
  skip: "Chuyển đến nội dung",
  header: {
    brandRole: "Frontend",
    primaryNav: "Điều hướng chính",
    mobileNav: "Điều hướng",
    menu: "Menu",
    openMenu: "Mở menu",
    closeMenu: "Đóng menu",
    downloadCv: "Tải CV",
    toDark: "Chuyển sang giao diện tối",
    toLight: "Chuyển sang giao diện sáng",
    language: "English",
    languageShort: "EN",
  },
  rail: { label: "Hành trình", start: "Khởi đầu", contact: "Liên hệ" },
  hero: {
    eyebrow: "Hành trình của một developer",
    explore: "Khám phá hành trình",
    projects: "Xem dự án",
    downloadCv: "Tải CV",
    experience: "Kinh nghiệm",
    years: "năm · frontend",
    focus: "Trọng tâm",
    scroll: "Cuộn để bắt đầu",
  },
  stage: { stop: "Chặng", technologies: "Công nghệ" },
  previewNote: "Điểm dừng dự án · bản dựng lại có tương tác với dữ liệu mẫu, không phải ảnh chụp sản phẩm thật",
  caseStudy: {
    role: "Vai trò",
    period: "Thời gian",
    stack: "Công nghệ",
    visit: "Truy cập",
    challenge: "Bài toán",
    interface: "giao diện",
    owned: "Phần tôi trực tiếp làm",
    team: "Team và bối cảnh",
    decisions: "Quyết định kỹ thuật",
    outcomes: "Kết quả đo được",
    details: "Chi tiết kỹ thuật",
  },
  attribution: { personal: "Tôi trực tiếp làm", outcome: "Kết quả từ phần tôi làm", team: "Quy mô sản phẩm / team" },
  ai: { label: "AI engineering" },
  approach: {
    label: "Cách làm việc",
    title: "Cách tôi tư duy về frontend.",
    intro: "Sáu mảng tôi thường được tin tưởng giao phó, mỗi mảng đều có sản phẩm thực tế chứng minh. Chọn một mảng để xem cách tôi áp dụng.",
    inPractice: "Trong thực tế",
    toolkit: "Công cụ",
    toolkitNote: "Những gì tôi dùng trong production. Không có thanh phần trăm.",
  },
  contact: {
    eyebrow: "Cuối con đường",
    label: "Liên hệ",
    lead: "Cùng xây dựng những sản phẩm",
    accent: "vận hành mượt mà.",
    body: "Tôi đang sẵn sàng cho cơ hội mới. Cách nhanh nhất để liên hệ là email. CV có đầy đủ thông tin chi tiết.",
    copy: "Sao chép email",
    copied: "Đã sao chép",
    downloadCv: "Tải CV",
    portrait: "Ảnh chân dung Nguyễn Song Tài",
  },
  footer: {
    thanks: "Cảm ơn bạn đã đọc",
    built: "Tự thiết kế và xây dựng với Next.js, TypeScript, Tailwind CSS và Motion.",
    source: "Xem mã nguồn",
    dateLocale: "vi-VN",
  },
  canvas: { loading: "Đang tải hành trình", next: "Tiếp theo" },
};
