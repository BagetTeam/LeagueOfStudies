// Deathmatch
// Mock data - in a real app, this would come from an API based on the subject ID
const mockGameData = {
  subject: "Biology",
  topic: "Cell Structure",
  questions: [
    {
      id: 1,
      question:
        "Which organelle is responsible for protein synthesis in cells?",
      options: ["Mitochondria", "Nucleus", "Ribosome", "Golgi Apparatus"],
      correctAnswer: 2,
    },
    {
      id: 2,
      question: "What is the powerhouse of the cell?",
      options: ["Ribosome", "Mitochondria", "Endoplasmic Reticulum", "Nucleus"],
      correctAnswer: 1,
    },
    {
      id: 3,
      question:
        "Which of the following is NOT a function of the cell membrane?",
      options: [
        "Transport of materials",
        "Cell signaling",
        "Energy production",
        "Structural support",
      ],
      correctAnswer: 2,
    },
    {
      id: 4,
      question: "Which structure is responsible for cell division?",
      options: ["Lysosome", "Golgi Apparatus", "Centriole", "Vacuole"],
      correctAnswer: 2,
    },
    {
      id: 5,
      question: "What is the main function of chloroplasts?",
      options: [
        "Cellular respiration",
        "Photosynthesis",
        "Protein synthesis",
        "Waste removal",
      ],
      correctAnswer: 1,
    },
  ],
};
