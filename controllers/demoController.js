const data = {
  subjects: ["การเขียนโปรแกรม", "การพัฒนาเว็บไซต์"],
  levels: [],
  teachingMethods: ["เรียนกลุ่ม", "ไฮบริด (ออนไลน์ + ตัวต่อตัว)"],
  ageGroups: ["ประถมศึกษา", "วัยทำงาน / ผู้ใหญ่", "มัธยมศึกษา", "มหาวิทยาลัย"],
  courses: [
    {
      name: "การเขียนโมบายแอพ",
      details: "เขียนแอพด้วยภาษา react-native",
      duration: "1 ชั่วโมง",
      price: "300",
    },
    {
      name: "การสร้างเว็บ portfolio",
      details:
        "พัฒนาด้วย react.js และ สิ่งที่จะได้เรียน พื้นฐานของการพัฒนาเว็บไซต์ HTML JavaScript CSS SQL การประยุกต์ใช้แทมเพลตฟรีเพื่อสร้างเว็บ ทำโปรเจคมินิ การ Deploy เว็บไซต์ รายละเอียดอื่นๆนักเรียนสามารถพูดคุยเพิ่มเติมได้",
      duration: "1 ชั่วโมง",
      price: "300",
    },
  ],
  schedule: [
    {
      day: "จันทร์-ศุกร์",
      time: "10.00-12.00, 11.00-15.00",
    },
    {
      day: "เสาร์-อาทิตย์",
      time: "10.00-12.00, 11.00-15.00",
    },
  ],
  id: 5,
  userId: 3,
  name: "เอกกี้ สอนเขียนเว็บ",
  email: "subdomain@gmail.com",
  profileImage: "https://apigusorn.neuatech.com/uploads/profile_images/ai.jpg",
  introVideo: "https://apigusorn.neuatech.com/uploads/intro_videos/demo.mov",
  phone: "0987654321",
  location: "กรุงเทพ",
  subdomain: "subdomain",
  bio: "เป็นติวเตอร์สอนพิเศษด้านการเขียนโปรแกรม ผมจบปริญญาโทด้านวิทยาการคอมพิวเตอร์จากมหาวิทยาลัยธรรมศาสตร์ ส่วนปริญญาตรีจบเทคโนโลยีสารสนเทศ ช่วงปริญญาโททำโปรเจคเกี่ยวกับโมเดลการสื่อสารโดยใช้ Machine Learning กับ Python ส่วนตอนปริญญาตรีโปรเจคจบทำระบบจองคิวร้านคาร์แคร์ เป็นแอปพลิเคชันที่ใช้ JAVA และ PHP ตอนนั้นยอมรับเลยว่ามันโคตรยาก เพราะไม่มีใครช่วย ต้องลุยเองหมด พอผ่านมาได้เลยเข้าใจเลยครับว่าหากมีคนให้คำแนะนำในช่วงนั้นได้คงดีไม่น้อย",
  experience: null,
  price: 300,
  createdAt: "2025-03-02T05:33:50.000Z",
  updatedAt: "2025-03-02T05:33:50.000Z",
  User: {
    id: 3,
    email: "thaurttt2557@gmail.com",
    username: "thaurttt2557",
  },
};

exports.getDataDemo = async (req, res) => {
    try {
      res.status(200).json({ message: "✅ ดึงข้อมูลสำเร็จ!", data });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ message: "❌ ไม่สามารถดึงข้อมูลได้" });
    }
  };