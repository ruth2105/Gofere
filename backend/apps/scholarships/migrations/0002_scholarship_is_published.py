from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('scholarships', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='scholarship',
            name='is_published',
            field=models.BooleanField(
                default=False,
                help_text='Only published scholarships are visible through the public API.',
            ),
        ),
    ]
