import { Request, Response } from 'express';
import DailyArticle from '../models/DailyArticle';
import UserBookmark from '../models/UserBookmark';
import { generateDailyArticle } from '../services/geminiService';

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getRandomBackgroundColor = (): string => {
  const colors = ['#e0f2e9', '#fef3c7', '#dbeafe', '#f3e8ff', '#ffe4e6'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const getTodayArticle = async (req: Request, res: Response) => {
  try {
    const today = getTodayDateString();
    
    let article = await DailyArticle.findOne({ date: today });
    
    if (!article) {
      const generated = await generateDailyArticle();
      
      article = await DailyArticle.create({
        date: today,
        title: generated.title,
        content: generated.content,
        keywords: generated.keywords,
        readTime: generated.readTime,
        illustrationData: {
          character: 'blob',
          backgroundColor: getRandomBackgroundColor()
        }
      });
    }

    const userId = req.query.userId as string;
    let isBookmarked = false;
    
    if (userId) {
      const bookmark = await UserBookmark.findOne({
        userId,
        articleId: article._id
      });
      isBookmarked = !!bookmark;
    }

    res.status(200).json({
      status: 'success',
      data: {
        article,
        isBookmarked
      }
    });
  } catch (error) {
    console.error('Get today article error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch today\'s article'
    });
  }
};

export const getLast7DaysArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string;
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const startDate = sevenDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const articles = await DailyArticle.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    let articlesWithBookmarks: any[] = articles;
    
    if (userId) {
      const bookmarks = await UserBookmark.find({
        userId,
        articleId: { $in: articles.map(a => a._id) }
      });
      
      const bookmarkedIds = new Set(bookmarks.map(b => b.articleId.toString()));
      
      articlesWithBookmarks = articles.map(article => ({
        ...article.toObject(),
        isBookmarked: bookmarkedIds.has((article._id as any).toString())
      }));
    }

    res.status(200).json({
      status: 'success',
      data: {
        articles: articlesWithBookmarks
      }
    });
  } catch (error) {
    console.error('Get last 7 days articles error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch articles'
    });
  }
};

export const getArticleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.query.userId as string;
    
    const article = await DailyArticle.findById(id);
    
    if (!article) {
      res.status(404).json({
        status: 'error',
        message: 'Article not found'
      });
      return;
    }

    let isBookmarked = false;
    if (userId) {
      const bookmark = await UserBookmark.findOne({
        userId,
        articleId: article._id
      });
      isBookmarked = !!bookmark;
    }

    res.status(200).json({
      status: 'success',
      data: {
        article,
        isBookmarked
      }
    });
  } catch (error) {
    console.error('Get article by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch article'
    });
  }
};

export const bookmarkArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, articleId } = req.body;

    if (!userId || !articleId) {
      res.status(400).json({
        status: 'error',
        message: 'userId and articleId are required'
      });
      return;
    }

    const existingBookmark = await UserBookmark.findOne({ userId, articleId });
    
    if (existingBookmark) {
      res.status(400).json({
        status: 'error',
        message: 'Article already bookmarked'
      });
      return;
    }

    const bookmark = await UserBookmark.create({
      userId,
      articleId,
      bookmarkedAt: new Date()
    });

    res.status(201).json({
      status: 'success',
      data: { bookmark }
    });
  } catch (error) {
    console.error('Bookmark article error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to bookmark article'
    });
  }
};

export const removeBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, articleId } = req.body;

    if (!userId || !articleId) {
      res.status(400).json({
        status: 'error',
        message: 'userId and articleId are required'
      });
      return;
    }

    const result = await UserBookmark.findOneAndDelete({ userId, articleId });

    if (!result) {
      res.status(404).json({
        status: 'error',
        message: 'Bookmark not found'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove bookmark'
    });
  }
};

export const getUserBookmarkedArticles = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const bookmarks = await UserBookmark.find({ userId })
      .populate('articleId')
      .sort({ bookmarkedAt: -1 });

    const articles = bookmarks
      .filter(b => b.articleId)
      .map(b => ({
        ...(b.articleId as any).toObject(),
        isBookmarked: true,
        bookmarkedAt: b.bookmarkedAt
      }));

    res.status(200).json({
      status: 'success',
      data: { articles }
    });
  } catch (error) {
    console.error('Get bookmarked articles error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookmarked articles'
    });
  }
};

export const generateTodayArticleManually = async (req: Request, res: Response) => {
  try {
    const today = getTodayDateString();
    
    await DailyArticle.deleteOne({ date: today });
    
    const generated = await generateDailyArticle();
    
    const article = await DailyArticle.create({
      date: today,
      title: generated.title,
      content: generated.content,
      keywords: generated.keywords,
      readTime: generated.readTime,
      illustrationData: {
        character: 'blob',
        backgroundColor: getRandomBackgroundColor()
      }
    });

    res.status(201).json({
      status: 'success',
      data: { article }
    });
  } catch (error) {
    console.error('Generate article manually error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate article'
    });
  }
};