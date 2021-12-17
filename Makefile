.PHONY: \
	test_db\
	deploy_db

deploy_db:
	docker-compose up -d db db-test

test_db:
	./clean-volumes.sh
	docker-compose build db db-test
	docker-compose up db db-test
