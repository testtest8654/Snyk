const express         = require('express');
const router          = express.Router({caseSensitive: true});
const JWTHelper       = require('../helpers/JWTHelper');
const AuthMiddleware  = require('../middleware/AuthMiddleware');
const routeCache      = require('route-cache');
const bot             = require('../bot');
const { makeHTML, filterInput } = require('../helpers/MDHelper');

let db;
let botVisiting = false;
const response = data => ({ message: data });
const cacheKey = (req, res) => {
	return `_${req.headers.host}_${req.url}_${(req.headers['x-forwarded-for'] || req.ip)}`;
}

router.get('/', (req, res) => {
	return res.render('login.html');
});

router.get('/register', (req, res) => {
	return res.render('register.html');
});

router.post('/api/register', async (req, res) => {
	const { username, password } = req.body;

	if (username && password) {
		return db.checkUser(username)
			.then(user => {
				if (user) return res.status(401).send(response('User already registered!'));
				return db.registerUser(username, password)
					.then(()  => res.send(response('User registered successfully!')))
			})
			.catch(() => res.send(response('Something went wrong!')));
	}
	return res.status(401).send(response('Please fill out all the required fields!'));
});

router.post('/api/login', async (req, res) => {
	const { username, password } = req.body;

	if (username && password) {
		return db.loginUser(username, password)
			.then(user => {
				let token = JWTHelper.sign(user);
				res.cookie('session', token, { maxAge: 3600000 });
				return res.send(response('User authenticated successfully!'));
			})
			.catch(() => res.status(403).send(response('Invalid username or password!')));
	}
	return res.status(500).send(response('Missing parameters!'));
});

router.get('/home', AuthMiddleware, routeCache.cacheSeconds(30, cacheKey), async (req, res) => {
	let threads = await db.getThreads();
	let categories = await db.getCategories();

	return res.render('home.html', {threads, categories, user:req.user});
});

router.get('/threads/new', AuthMiddleware, async (req, res) => {
	let categories = await db.getCategories();

	return res.render('new-thread.html', {categories, user:req.user});
});

router.post('/threads/create', AuthMiddleware, async (req, res) => {
	const {title, content, cat_id} = req.body;

	if (cat_id == 1) {
		if (req.user.user_role !== 'Administrator') {
			return res.status(403).send(response('Not Allowed!'));
		}
	}

	category = await db.getCategoryById(parseInt(cat_id));

	if(category.hasOwnProperty('id')) {
		try {
			createThread = await db.createThread(req.user.id, category.id, title);
		}
		catch {
			return res.redirect('/threads/new');
		}

		newThread = await db.getLastThreadId();
		html_content = makeHTML(content);

		return db.postThreadReply(req.user.id, newThread.id, filterInput(html_content))
			.then(() => {
				return res.redirect(`/threads/${newThread.id}`);
			})
			.catch((e) => {
				return res.redirect('/threads/new');
			});
	} else {
		return res.redirect('/threads/new');
	}
});

router.post('/threads/preview', AuthMiddleware, routeCache.cacheSeconds(30, cacheKey), async (req, res) => {
	const {title, content, cat_id} = req.body;

	if (cat_id == 1) {
		if (req.user.user_role !== 'Administrator') {
			return res.status(403).send(response('Not Allowed!'));
		}
	}

	category = await db.getCategoryById(parseInt(cat_id));
	safeContent = makeHTML(filterInput(content));

	return res.render('preview-thread.html', {category, title, content:safeContent, user:req.user});
});

router.get('/threads/preview', AuthMiddleware, routeCache.cacheSeconds(30, cacheKey), async (req, res) => {
	return res.redirect('/threads/new');
});

router.get('/threads/:id', AuthMiddleware, routeCache.cacheSeconds(30, cacheKey), async (req, res) => {
	const { id } = req.params;
	if(!isNaN(parseInt(id))) {
		thread = await db.getThreadById(parseInt(id));
		posts = await db.getPostsByThread(parseInt(id));

		if(!thread) return res.redirect('/home');

		return res.render('thread.html', {thread, posts, user:req.user});
	} else {
		return res.redirect('/home');
	}
});

router.post('/api/threads/reply', AuthMiddleware, async (req, res) => {
	const { id, comment } = req.body;
	const html_content = makeHTML(comment);

	if(!isNaN(parseInt(id))) {
		return db.postThreadReply(req.user.id, parseInt(id), filterInput(html_content))
			.then(() => {
				res.send(response('Thread reply posted successfully!'));
			})
			.catch((e) => {
				res.status(500).send(response('Failed to post thread reply!'));
			});
	} else {
		return res.status(500).send(response('Missing required parameters!'));
	}
});

router.post('/api/report', async (req, res) => {
	const { post_id } = req.body;
	if (botVisiting) return res.status(403).send(response('Please wait for the previous report to process first!'));
	if(post_id) {
		botVisiting = true;
		return bot.visitPost(post_id)
			.then(() => {
				botVisiting = false;
				return res.send(response('Report received successfully!'));
			})
			.catch(e => {
				console.log(e);
				botVisiting = false;
				return res.status(403).send(response('Something went wrong, please try again!'));
			})
	}
	return res.status(500).send(response('Missing required parameters!'));
});

router.get('/report/:id', AuthMiddleware, async (req, res) => {
	if (req.user.user_role !== 'moderator') return res.redirect('/home');
	const { id } = req.params;

	threadPost = await db.getPostById(id);
	if (!threadPost) return res.redirect('/home');

	res.render('report.html', {threadPost});
});

router.get('/logout', (req, res) => {
	res.clearCookie('session');
	return res.redirect('/');
});

module.exports = database => {
	db = database;
	return router;
};