export class CreateTrainingDto {
  createdBy: number
  title: string
  description?: string
  category: 'general' | 'tank' | 'dps' | 'support' | 'strategy'
  content: string
  videoUrl?: string
}
