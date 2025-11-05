"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTodayArticleManually = exports.getUserBookmarkedArticles = exports.removeBookmark = exports.bookmarkArticle = exports.getArticleById = exports.getLast7DaysArticles = exports.getTodayArticle = void 0;
const DailyArticle_1 = __importDefault(require("../models/DailyArticle"));
const UserBookmark_1 = __importDefault(require("../models/UserBookmark"));
const User_1 = __importDefault(require("../models/User"));
const geminiService_1 = require("../services/geminiService");
const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};
const getRandomBackgroundColor = () => {
    const colors = ['#e0f2e9', '#fef3c7', '#dbeafe', '#f3e8ff', '#ffe4e6'];
    return colors[Math.floor(Math.random() * colors.length)];
};
// Helper function to get MongoDB User ID from Firebase authUid
const getMongoUserIdFromAuthUid = async (authUid) => {
    try {
        console.log('🔍 Looking up user with authUid:', authUid);
        const user = await User_1.default.findOne({ authUid });
        if (user) {
            console.log('✅ Found user:', user._id);
            return user._id;
        }
        console.log('⚠️ No user found with authUid:', authUid);
        return null;
    }
    catch (error) {
        console.error('❌ Error finding user:', error);
        return null;
    }
};
const getTodayArticle = async (req, res) => {
    try {
        console.log('📰 Getting today article...');
        const today = getTodayDateString();
        let article = await DailyArticle_1.default.findOne({ date: today });
        if (!article) {
            console.log('📝 No article for today, generating...');
            const generated = await (0, geminiService_1.generateDailyArticle)();
            article = await DailyArticle_1.default.create({
                date: today,
                title: generated.title,
                content: generated.content,
                keywords: generated.keywords,
                readTime: generated.readTime,
                author: generated.author,
                sourceUrl: generated.sourceUrl,
                illustrationData: {
                    character: 'blob',
                    backgroundColor: getRandomBackgroundColor()
                }
            });
            console.log('✅ Article generated:', article._id);
        }
        else {
            console.log('✅ Found existing article:', article._id);
        }
        const authUid = req.query.userId;
        let isBookmarked = false;
        if (authUid) {
            console.log('🔖 Checking bookmark for authUid:', authUid);
            // Convert Firebase authUid to MongoDB _id
            const mongoUserId = await getMongoUserIdFromAuthUid(authUid);
            if (mongoUserId) {
                const bookmark = await UserBookmark_1.default.findOne({
                    userId: mongoUserId,
                    articleId: article._id
                });
                isBookmarked = !!bookmark;
                console.log('🔖 Bookmark status:', isBookmarked);
            }
        }
        console.log('✅ Sending article response');
        res.status(200).json({
            status: 'success',
            data: {
                article,
                isBookmarked
            }
        });
    }
    catch (error) {
        console.error('❌ Get today article error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch today\'s article'
        });
    }
};
exports.getTodayArticle = getTodayArticle;
const getLast7DaysArticles = async (req, res) => {
    try {
        const authUid = req.query.userId;
        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startDate = sevenDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
        const todayDateString = getTodayDateString();
        let todayArticle = await DailyArticle_1.default.findOne({ date: todayDateString });
        if (!todayArticle) {
            console.log('📝 No article for today found in getLast7Days, generating...');
            const generated = await (0, geminiService_1.generateDailyArticle)();
            todayArticle = await DailyArticle_1.default.create({
                date: todayDateString,
                title: generated.title,
                content: generated.content,
                keywords: generated.keywords,
                readTime: generated.readTime,
                author: generated.author,
                sourceUrl: generated.sourceUrl,
                illustrationData: {
                    character: 'blob',
                    backgroundColor: getRandomBackgroundColor()
                }
            });
            console.log('✅ Today article auto-generated:', todayArticle._id);
        }
        const articles = await DailyArticle_1.default.find({
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: -1 });
        let articlesWithBookmarks = articles;
        if (authUid) {
            // Convert Firebase authUid to MongoDB _id
            const mongoUserId = await getMongoUserIdFromAuthUid(authUid);
            if (mongoUserId) {
                const bookmarks = await UserBookmark_1.default.find({
                    userId: mongoUserId,
                    articleId: { $in: articles.map(a => a._id) }
                });
                const bookmarkedIds = new Set(bookmarks.map(b => b.articleId.toString()));
                articlesWithBookmarks = articles.map(article => ({
                    ...article.toObject(),
                    isBookmarked: bookmarkedIds.has(article._id.toString())
                }));
            }
        }
        res.status(200).json({
            status: 'success',
            data: {
                articles: articlesWithBookmarks
            }
        });
    }
    catch (error) {
        console.error('Get last 7 days articles error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch articles'
        });
    }
};
exports.getLast7DaysArticles = getLast7DaysArticles;
const getArticleById = async (req, res) => {
    try {
        const { id } = req.params;
        const authUid = req.query.userId;
        const article = await DailyArticle_1.default.findById(id);
        if (!article) {
            res.status(404).json({
                status: 'error',
                message: 'Article not found'
            });
            return;
        }
        let isBookmarked = false;
        if (authUid) {
            // Convert Firebase authUid to MongoDB _id
            const mongoUserId = await getMongoUserIdFromAuthUid(authUid);
            if (mongoUserId) {
                const bookmark = await UserBookmark_1.default.findOne({
                    userId: mongoUserId,
                    articleId: article._id
                });
                isBookmarked = !!bookmark;
            }
        }
        res.status(200).json({
            status: 'success',
            data: {
                article,
                isBookmarked
            }
        });
    }
    catch (error) {
        console.error('Get article by ID error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch article'
        });
    }
};
exports.getArticleById = getArticleById;
const bookmarkArticle = async (req, res) => {
    try {
        const { userId, articleId } = req.body;
        if (!userId || !articleId) {
            res.status(400).json({
                status: 'error',
                message: 'userId and articleId are required'
            });
            return;
        }
        // Convert Firebase authUid to MongoDB _id if needed
        let mongoUserId = userId;
        // Check if userId is a Firebase authUid (not a valid ObjectId format)
        if (userId.length !== 24) {
            const user = await User_1.default.findOne({ authUid: userId });
            if (!user) {
                res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
                return;
            }
            mongoUserId = user._id;
        }
        const existingBookmark = await UserBookmark_1.default.findOne({
            userId: mongoUserId,
            articleId
        });
        if (existingBookmark) {
            res.status(400).json({
                status: 'error',
                message: 'Article already bookmarked'
            });
            return;
        }
        const bookmark = await UserBookmark_1.default.create({
            userId: mongoUserId,
            articleId,
            bookmarkedAt: new Date()
        });
        res.status(201).json({
            status: 'success',
            data: { bookmark }
        });
    }
    catch (error) {
        console.error('Bookmark article error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to bookmark article'
        });
    }
};
exports.bookmarkArticle = bookmarkArticle;
const removeBookmark = async (req, res) => {
    try {
        const { userId, articleId } = req.body;
        if (!userId || !articleId) {
            res.status(400).json({
                status: 'error',
                message: 'userId and articleId are required'
            });
            return;
        }
        // Convert Firebase authUid to MongoDB _id if needed
        let mongoUserId = userId;
        if (userId.length !== 24) {
            const user = await User_1.default.findOne({ authUid: userId });
            if (!user) {
                res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
                return;
            }
            mongoUserId = user._id;
        }
        const result = await UserBookmark_1.default.findOneAndDelete({
            userId: mongoUserId,
            articleId
        });
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
    }
    catch (error) {
        console.error('Remove bookmark error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to remove bookmark'
        });
    }
};
exports.removeBookmark = removeBookmark;
const getUserBookmarkedArticles = async (req, res) => {
    try {
        const authUid = req.params.userId;
        // Convert Firebase authUid to MongoDB _id
        const mongoUserId = await getMongoUserIdFromAuthUid(authUid);
        if (!mongoUserId) {
            res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
            return;
        }
        const bookmarks = await UserBookmark_1.default.find({ userId: mongoUserId })
            .populate('articleId')
            .sort({ bookmarkedAt: -1 });
        const articles = bookmarks
            .filter(b => b.articleId)
            .map(b => ({
            ...b.articleId.toObject(),
            isBookmarked: true,
            bookmarkedAt: b.bookmarkedAt
        }));
        res.status(200).json({
            status: 'success',
            data: { articles }
        });
    }
    catch (error) {
        console.error('Get bookmarked articles error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch bookmarked articles'
        });
    }
};
exports.getUserBookmarkedArticles = getUserBookmarkedArticles;
const generateTodayArticleManually = async (req, res) => {
    try {
        const today = getTodayDateString();
        await DailyArticle_1.default.deleteOne({ date: today });
        const generated = await (0, geminiService_1.generateDailyArticle)();
        const article = await DailyArticle_1.default.create({
            date: today,
            title: generated.title,
            content: generated.content,
            keywords: generated.keywords,
            readTime: generated.readTime,
            author: generated.author,
            sourceUrl: generated.sourceUrl,
            illustrationData: {
                character: 'blob',
                backgroundColor: getRandomBackgroundColor()
            }
        });
        res.status(201).json({
            status: 'success',
            data: { article }
        });
    }
    catch (error) {
        console.error('Generate article manually error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to generate article'
        });
    }
};
exports.generateTodayArticleManually = generateTodayArticleManually;
//# sourceMappingURL=articleController.js.map