
import { Resource } from './types';

// 当您修改了下面的数据集并希望 Vercel 上的用户看到更新时，请增加此版本号（例如从 '1.0.1' 改为 '1.0.2'）
export const APP_DATA_VERSION = '1.0.2'; 

export const DATASET: Resource[] = [
  {
    id: '1',
    title: '小熊宝宝绘本：刷牙',
    ageRange: '1-3岁',
    whyItsGood: '通过生动的小熊形象，教导幼儿学习正确刷牙。',
    description: '小熊宝宝绘本系列是许多家庭的入园准备首选。这一册专门讲述刷牙，文字简单重复，画面温馨。适合家长带着孩子一边读一边模仿刷牙的动作。',
    categories: ['生活习惯', '认知', '故事'],
    type: 'book',
    image: 'https://picsum.photos/seed/brush1/400/500'
  },
  {
    id: '2',
    title: '鳄鱼怕怕，牙医怕怕',
    ageRange: '2-5岁',
    whyItsGood: '幽默感十足，用心理战术让孩子明白看牙医其实并不可怕。',
    description: '鳄鱼牙痛去看牙医，牙医也很害怕鳄鱼。他们心里的台词竟然一模一样！这种巧妙的设计让孩子在欢笑中缓解对牙医的恐惧。',
    categories: ['生活习惯', '情商', '故事'],
    type: 'book',
    image: 'https://picsum.photos/seed/brush2/400/500'
  },
  {
    id: '3',
    title: '肚子里有个火车站',
    ageRange: '3-7岁',
    whyItsGood: '科普绘本，将消化系统拟人化。',
    description: '肚子里的“小精灵”在火车站忙碌地搬运食物。如果吃得太快或太凉，火车站就会出故障。通过想象力让孩子了解健康的饮食习惯。',
    categories: ['科普', '认知', '绘本'],
    type: 'book',
    image: 'https://picsum.photos/seed/brush3/400/500'
  },
  {
    id: '4',
    title: '卡坦岛(Catan Junior) 少儿版',
    ageRange: '6岁+',
    whyItsGood: '经典的资源管理游戏简化版，锻炼逻辑规划。',
    description: '作为最负盛名的桌游之一的少儿版，它保留了核心的资源交换机制。孩子们通过建造海盗巢穴来竞争，不仅有趣还能学习基础的经济思维。',
    categories: ['逻辑思考', '数学', '社交'],
    type: 'game',
    image: 'https://picsum.photos/seed/game1/400/500'
  }
];
