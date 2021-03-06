from app.models import db, User


# Adds a demo user, you can add other users here if you want
def seed_users():
    demo = User(
        first_name='demo',
        last_name='user1',
        username='Demo',
        email='demo@aa.io',
        password='password',
        portfolio_value=500.00,
        buying_power=500.00,
        )
    marnie = User(
        first_name='demo',
        last_name='user2',
        username='marnie',
        email='marnie@aa.io',
        password='password',
        portfolio_value=500.00,
        buying_power=500.00,
        )
    bobbie = User(
        first_name='demo',
        last_name='user3',
        username='bobbie',
        email='bobbie@aa.io',
        password='password',
        portfolio_value=500.00,
        buying_power=500.00,
        )

    db.session.add(demo)
    db.session.add(marnie)
    db.session.add(bobbie)

    db.session.commit()


# Uses a raw SQL query to TRUNCATE the users table.
# SQLAlchemy doesn't have a built in function to do this
# TRUNCATE Removes all the data from the table, and RESET IDENTITY
# resets the auto incrementing primary key, CASCADE deletes any
# dependent entities
def undo_users():
    db.session.execute('TRUNCATE users RESTART IDENTITY CASCADE;')
    db.session.commit()
