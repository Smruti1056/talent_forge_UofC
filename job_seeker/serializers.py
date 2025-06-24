from rest_framework import serializers
from .models import (
    JobSeekerProfile, Education, Certification, Skill, JobSeekerSkill
)
from user.models import CustomUser


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        exclude = ('job_seeker',)


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        exclude = ('job_seeker',)


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['name']


class JobSeekerProfileSerializer(serializers.ModelSerializer):
    educations = EducationSerializer(many=True)
    certifications = CertificationSerializer(many=True)
    skills = serializers.ListField(child=serializers.CharField())

    class Meta:
        model = JobSeekerProfile
        exclude = ('user',)  # Assuming you'll set user in the view

    def create(self, validated_data):
        educations_data = validated_data.pop('educations', [])
        certifications_data = validated_data.pop('certifications', [])
        skills_data = validated_data.pop('skills', [])
        user = self.context['request'].user

        profile = JobSeekerProfile.objects.create(user=user, **validated_data)

        # Handle skills
        for name in skills_data:
            skill, _ = Skill.objects.get_or_create(name=name)
            JobSeekerSkill.objects.get_or_create(
                job_seeker=profile,
                skill=skill,
                defaults={'proficiency': 'Beginner'}  # You can make this dynamic later
            )

        # Handle educations
        for edu_data in educations_data:
            Education.objects.create(job_seeker=profile, **edu_data)

        # Handle certifications
        for cert_data in certifications_data:
            Certification.objects.create(job_seeker=profile, **cert_data)

        return profile
