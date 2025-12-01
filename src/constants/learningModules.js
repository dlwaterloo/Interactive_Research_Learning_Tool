export const STATIC_KEYWORD_MODULE = {
  id: 'keywords',
  lesson: 'Module 1',
  title: 'Generate Keywords',
  level: 'Beginner',
  xp: 50,
  completed: false, 
  tasks: [
    { 
      id: 't1', 
      text: 'Lesson: What are research keywords?', 
      type: 'lesson',
      done: false, 
      userInput: '',
      content: {
        title: 'What are Research Keywords?',
        body: 'Keywords are the core concepts of your research question. Unlike natural language (how we speak), databases prefer specific nouns and verbs.\n\nFor example, instead of asking "How does social media make teenagers feel bad?", you would extract keywords like:\n• Social Media\n• Adolescents\n• Mental Health\n\nThese are the terms databases index.',
      }
    },
    { 
      id: 't2', 
      text: 'Exercise: Keyword Storm', 
      type: 'exercise',
      done: false, 
      userInput: '',
      content: {
        title: 'Exercise: Keyword Storm',
        body: 'Look at your research question. Write down every synonym you can think of for your main nouns.\n\nExample: "Teenagers"\n- Adolescents\n- Youth\n- Young Adults\n- High Schoolers\n\nUse the box below to generate your list.',
        interaction: {
          type: 'text',
          placeholder: 'Type your list of keywords and synonyms here...'
        }
      }
    }
  ],
  description: 'Identify core concepts. Don\'t just type your question. Break it down into nouns and verbs.',
};

export const STATIC_TOOL_MODULE = {
  id: 'tools_module',
  lesson: 'Toolkit',
  title: 'Research Utilities',
  level: 'All Levels',
  xp: 50,
  completed: false,
  tasks: [
    { 
      id: 't3', 
      text: 'Interactive: Keyword Converter', 
      type: 'interactive',
      done: false,
      userInput: '',
      content: {
        title: 'Keyword Converter Tool',
        body: 'Type a research question below. Our Gemini-powered AI will analyze your natural language and extract the strongest academic keywords and synonyms for database searching.'
      }
    }
  ],
  description: 'Helpful tools for your research journey.',
};

export const LEARNING_MODULES = [
  STATIC_KEYWORD_MODULE,
  {
    id: 'boolean',
    lesson: 'Module 2',
    title: 'Master Boolean Search',
    level: 'Intermediate',
    xp: 100,
    completed: false,
    tasks: [
      { 
        id: 't4', 
        text: 'Lesson: What is AND, OR, NOT?', 
        type: 'lesson',
        done: false,
        userInput: '',
        content: {
          title: 'Boolean Logic 101',
          body: 'Boolean operators are simple words (AND, OR, NOT) used as conjunctions to combine or exclude keywords in a search.\n\n• AND: Narrows results (Social Media AND Anxiety)\n• OR: Broadens results (Teenagers OR Adolescents)\n• NOT: Excludes results (Social Media NOT Facebook)'
        }
      },
      { 
        id: 't5', 
        text: 'Practice: Write 3 boolean strings', 
        type: 'exercise',
        done: false,
        userInput: '',
        content: {
          title: 'Practice: String Builder',
          body: 'Try building a search string for your topic using at least one AND and one OR operator.',
          interaction: {
            type: 'text',
            placeholder: 'Example: (AI OR Artificial Intelligence) AND Education'
          }
        }
      }
    ],
    description: 'Use AND, OR, NOT operators to refine results.',
  },
  {
    id: 'credibility',
    lesson: 'Module 3',
    title: 'The Credibility Hunt',
    level: 'Advanced',
    xp: 150,
    completed: false,
    tasks: [
      { 
        id: 't6', 
        text: 'Evaluate the CRAAP test', 
        type: 'lesson', 
        done: false, 
        userInput: '',
        content: { 
          title: 'The CRAAP Test', 
          body: 'Currency, Relevance, Authority, Accuracy, Purpose. These are the 5 pillars of evaluating a source.',
          interaction: {
            type: 'choice',
            question: 'Which criteria do you find hardest to evaluate?',
            options: ['Currency', 'Relevance', 'Authority', 'Accuracy', 'Purpose']
          }
        } 
      },
      { 
        id: 't7', 
        text: 'Check author credentials', 
        type: 'exercise', 
        done: false, 
        userInput: '',
        content: { 
          title: 'Who wrote this?', 
          body: 'Find the author of your current paper. Search them on Google Scholar.',
          interaction: {
            type: 'text',
            placeholder: 'Paste the author\'s biography or h-index here...'
          }
        } 
      }
    ],
    description: 'Evaluate the CRAAP test: Currency, Relevance, Authority, Accuracy, and Purpose.',
  },
  {
    id: 'types',
    lesson: 'Module 4',
    title: 'Choosing Paper Types',
    level: 'Intermediate',
    xp: 75,
    completed: false,
    tasks: [
      { 
        id: 't8', 
        text: 'Systematic Reviews vs Empirical', 
        type: 'lesson', 
        done: false, 
        userInput: '',
        content: { 
          title: 'Paper Types', 
          body: 'Know the difference between a review (summary of existing lit) and a study (new experiment).',
          interaction: {
            type: 'choice',
            question: 'Which type serves your current need best?',
            options: ['Systematic Review (Broad Overview)', 'Empirical Study (Specific Data)', 'Meta-Analysis (Statistical Synthesis)']
          }
        } 
      }
    ],
    description: 'Choose based on your research phase.',
  },
  {
    id: 'citation',
    lesson: 'Module 5',
    title: 'Citation Chains',
    level: 'Advanced',
    xp: 200,
    completed: false,
    tasks: [
      { 
        id: 't9', 
        text: 'Forward Citation check', 
        type: 'exercise', 
        done: false, 
        userInput: '',
        content: { 
          title: 'Forward Chaining', 
          body: 'See who cited this paper since it was published. This helps find newer research.',
          interaction: {
            type: 'text',
            placeholder: 'How many citations does this paper have?'
          }
        } 
      }
    ],
    description: 'Look at who cited this paper (forward) and who this paper cited (backward).',
  },
  STATIC_TOOL_MODULE
];

