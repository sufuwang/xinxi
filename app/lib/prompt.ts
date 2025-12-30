// 性格分析
export const Character = '根据历史对话，简要分析性格特点。'

// 温馨提醒
export const Tip = '根据历史对话，简要给出注意事项和建议，按照有序列表的格式给出。'

// 温馨提醒
export const MBTI = '根据历史对话，分析我的 MBTI 类型，并给出原因。'

// 建议问题列表
export const Prompts = [
  { label: '性格分析', question: Character },
  { label: 'MBTI分析', question: MBTI },
  { label: '我需要注意什么？', question: Tip },
]
