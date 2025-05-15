import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  matchedUser: {
    username: String,
    githubUrl: String,
    twitterUrl: String,
    linkedinUrl: String,
    contributions: {
      points: Number,
      questionCount: Number,
      testcaseCount: Number,
    },
    profile: {
      realName: String,
      userAvatar: String,
      birthday: String,
      ranking: Number,
      reputation: Number,
      websites: [String],
      countryName: String,
      company: String,
      school: String,
      skillTags: [String],
      aboutMe: String,
      starRating: Number,
    },
    badges: [
      {
        id: String,
        displayName: String,
        icon: String,
        creationDate: String,
      },
    ],
    upcomingBadges: [
      {
        name: String,
        icon: String,
      },
    ],
    activeBadge: {
      id: String,
      displayName: String,
      icon: String,
      creationDate: String,
    },
    submitStats: {
      totalSubmissionNum: [
        {
          difficulty: String,
          count: Number,
          submissions: Number,
        },
      ],
      acSubmissionNum: [
        {
          difficulty: String,
          count: Number,
          submissions: Number,
        },
      ],
    },
    submissionCalendar: mongoose.Schema.Types.Mixed,
    languageProblemCount: [
      {
        languageName: String,
        problemsSolved: Number,
      },
    ],
    tagProblemCounts: {
      advanced: [
        {
          tagName: String,
          tagSlug: String,
          problemsSolved: Number,
        },
      ],
      intermediate: [
        {
          tagName: String,
          tagSlug: String,
          problemsSolved: Number,
        },
      ],
      fundamental: [
        {
          tagName: String,
          tagSlug: String,
          problemsSolved: Number,
        },
      ],
    },
  },
  allQuestionsCount: [
    {
      difficulty: String,
      count: Number,
    },
  ],
  recentSubmissionList: [
    {
      title: String,
      titleSlug: String,
      timestamp: String,
      statusDisplay: String,
      lang: String,
    },
  ],
  userContestRanking: {
    attendedContestsCount: Number,
    rating: Number,
    globalRanking: Number,
    totalParticipants: Number,
    topPercentage: Number,
    badge: {
      name: String,
    },
  },
  userContestRankingHistory: [
    {
      attended: Boolean,
      rating: Number,
      ranking: Number,
      trendDirection: String,
      problemsSolved: Number,
      totalProblems: Number,
      finishTimeInSeconds: Number,
      contest: {
        title: String,
        startTime: Number,
      },
    },
  ],
  additionalDetails : {
    userId: String,
    contestIds:[mongoose.Schema.Types.Mixed],
    channelIds:[mongoose.Schema.Types.Mixed],
    notification:[mongoose.Schema.Types.Mixed],
    codingRooms:[mongoose.Schema.Types.Mixed],
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
