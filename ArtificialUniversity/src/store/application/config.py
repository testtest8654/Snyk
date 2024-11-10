import os, sys

class Config(object):
	SECRET_KEY = os.urandom(50).hex()
	ADMIN_EMAIL = "ed@artificialuniversity.htb"
	ADMIN_PASS = os.urandom(32).hex()

class ProductionConfig(Config):
	pass

class DevelopmentConfig(Config):
	DEBUG = False

class TestingConfig(Config):
	TESTING = False