import mongoose from 'mongoose';

const dailyProblemSchema = new mongoose.Schema({
  activeDailyCodingChallengeQuestion: {
    date: String,
    link: String,
    question: {
      questionId: String,
      questionFrontendId: String,
      boundTopicId: String,
      title: String,
      titleSlug: String,
      content: String,
      translatedTitle: String,
      translatedContent: String,
      isPaidOnly: Boolean,
      difficulty: String,
      likes: Number,
      dislikes: Number,
      isLiked: Boolean,
      similarQuestions: [String],
      exampleTestcases: [String],
      contributors: [String],
      topicTags: [
        {
          name: String,
          slug: String
        }
      ],
      codeSnippets: [
        {
          lang: String,
          langSlug: String,
          code: String
        }
      ],
      stats: String,
      hints: [String],
      solution: {
        id: String,
        canSeeDetail: Boolean,
        paidOnly: Boolean,
        hasVideoSolution: Boolean,
        paidOnlyVideo: Boolean
      },
      status: String,
      sampleTestCase: String,
      metaData: {
        name: String,
        params: [
          {
            name: String,
            type: String
          }
        ],
        return: {
          type: String
        }
      },
      judgerAvailable: Boolean,
      judgeType: String,
      mysqlSchemas: [String],
      enableRunCode: Boolean,
      enableTestMode: Boolean,
      enableDebugger: Boolean,
      envInfo: String
    }
  }
});

const DailyProblem = mongoose.model('DailyProblem', dailyProblemSchema);

export default DailyProblem;
